"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type CreateEventResponse = {
  ok?: boolean;
  error?: string;
  id?: string;
  action?: "created" | "updated";
  slug?: string;
};

type UploadResponse = {
  ok?: boolean;
  error?: string;
  path?: string;
};

type EventFetchResponse = {
  ok?: boolean;
  error?: string;
  event?: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    status: "draft" | "published" | "archived";
    capacity_total: number;
    reg_open_at: string | null;
    reg_close_at: string | null;
    match_start_at: string | null;
    tournament_end_at: string | null;
    allow_public_registration: boolean;
    allow_public_live_report: boolean;
  };
  settings?: {
    identity?: {
      tingkatan_pertandingan?: string | null;
      penyelenggara_pertandingan?: string | null;
      provinsi_id?: string | null;
      kabupaten_kota_id?: string | null;
      tanggal_mulai_pertandingan?: string | null;
      tanggal_berakhir_pertandingan?: string | null;
      alamat_tempat_pertandingan?: string | null;
      link_map_lokasi_pertandingan?: string | null;
    };
    kategori?: {
      nomor_pertandingan?: string | null;
      jumlah_peserta?: number | null;
      jumlah_babak?: string;
      sistem_babak_pertama?: string | null;
    };
    hadiah?: Record<string, string | null | undefined>;
    pendaftaran?: {
      tanggal_dibuka_pendaftaran?: string | null;
      tanggal_ditutup_pendaftaran?: string | null;
      biaya_pendaftaran?: string | null;
    };
    dokumen?: Record<string, string | null | undefined>;
  };
  profile?: {
    tournament_level: string;
    organizer_level: string;
    province: string | null;
    city: string | null;
    venue_address: string | null;
    venue_map_url: string | null;
    event_start_at: string | null;
    event_end_at: string | null;
    event_number_category: string;
    participant_total: number;
    round_count: number;
    round_one_system: string;
    registration_open_at: string | null;
    registration_close_at: string | null;
    registration_fee: number | null;
    prize_1: number | null;
    prize_2: number | null;
    prize_3: number | null;
    prize_4: number | null;
    prize_5_8: number | null;
    prize_9_16: number | null;
    prize_17_32: number | null;
  } | null;
  documents?: Array<{ doc_type: UploadTarget; storage_path: string }>;
};

type CreateEventFormProps = {
  initialSlug?: string;
};

type RegionItem = {
  id: string;
  name: string;
};

type UploadTarget =
  | "org_recommendation"
  | "public_permit"
  | "flyer_16_9_1"
  | "flyer_16_9_2"
  | "flyer_9_16_1"
  | "flyer_9_16_2";

type DocumentConfig = {
  target: UploadTarget;
  label: string;
  accept: string;
  note?: string;
};

const TOURNAMENT_LEVEL_OPTIONS = ["Nasional", "Provinsi", "Kabupaten", "Kota"];
const ORGANIZER_OPTIONS = ["PB PORDI", "PENGPROV PORDI", "PENGKAB/PENGKOT PORDI"];
const EVENT_NUMBER_OPTIONS = [
  "Ganda - Open Tournament",
  "Tunggal - Open Tournament",
  "Ganda Putra",
  "Ganda Putri",
  "Ganda Campuran",
  "Tunggal Putra",
  "Tunggal Putri",
  "Tunggal Campuran",
];
const ROUND_COUNT_OPTIONS = ["Satu Babak", "Dua Babak"];
const FIRST_ROUND_SYSTEM_OPTIONS = ["Round Robin/Setengah Kompetisi", "Swiss", "Single Eliminasi/Gugur"];
const SECOND_ROUND_SYSTEM = "Single Elimination/Babak Gugur";

const DOCUMENTS: DocumentConfig[] = [
  {
    target: "org_recommendation",
    label: "Surat Rekomendasi Organisasi",
    accept: ".jpg,.jpeg,.png,.pdf",
    note: "Format file: JPG/PNG/PDF.",
  },
  {
    target: "public_permit",
    label: "Surat Izin Keramaian",
    accept: ".jpg,.jpeg,.png,.pdf",
    note: "Format file: JPG/PNG/PDF.",
  },
  {
    target: "flyer_16_9_1",
    label: "Flayer 1 (16 : 9)",
    accept: ".jpg,.jpeg,.png",
    note: "Format JPG/PNG. Rekomendasi ukuran: 1920 x 1080 px.",
  },
  {
    target: "flyer_16_9_2",
    label: "Flayer 2 (16 : 9)",
    accept: ".jpg,.jpeg,.png",
    note: "Format JPG/PNG. Rekomendasi ukuran: 1920 x 1080 px.",
  },
  {
    target: "flyer_9_16_1",
    label: "Flayer 3 (9 : 16)",
    accept: ".jpg,.jpeg,.png",
    note: "Format JPG/PNG. Rekomendasi ukuran: 1080 x 1920 px.",
  },
  {
    target: "flyer_9_16_2",
    label: "Flayer 4 (9 : 16)",
    accept: ".jpg,.jpeg,.png",
    note: "Format JPG/PNG. Rekomendasi ukuran: 1080 x 1920 px.",
  },
];

const DEFAULT_DOCS: Record<UploadTarget, string> = {
  org_recommendation: "",
  public_permit: "",
  flyer_16_9_1: "",
  flyer_16_9_2: "",
  flyer_9_16_1: "",
  flyer_9_16_2: "",
};

function extractDigits(value: string) {
  return value.replace(/\D/g, "");
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function numberToDigitString(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return String(Math.max(0, Math.floor(value)));
}

function formatRupiah(rawDigits: string) {
  if (!rawDigits) return "";
  const numeric = Number(rawDigits);
  if (Number.isNaN(numeric)) return "";
  return `Rp. ${numeric.toLocaleString("id-ID")},-`;
}

function slugify(source: string) {
  return source
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatUploadedName(path: string) {
  if (!path) return "Belum ada file";
  const split = path.split("/");
  return split[split.length - 1] ?? path;
}

function readFileToDigits(setter: (value: string) => void) {
  return (event: ChangeEvent<HTMLInputElement>) => {
    setter(extractDigits(event.target.value));
  };
}

export default function CreateEventForm({ initialSlug }: CreateEventFormProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [tournamentLevel, setTournamentLevel] = useState(TOURNAMENT_LEVEL_OPTIONS[0]);
  const [organizer, setOrganizer] = useState(ORGANIZER_OPTIONS[0]);
  const [provinceId, setProvinceId] = useState("");
  const [cityId, setCityId] = useState("");
  const [eventStartAt, setEventStartAt] = useState("");
  const [eventEndAt, setEventEndAt] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueMapUrl, setVenueMapUrl] = useState("");

  const [eventNumberCategory, setEventNumberCategory] = useState(EVENT_NUMBER_OPTIONS[0]);
  const [capacityTotal, setCapacityTotal] = useState(0);
  const [roundCount, setRoundCount] = useState(ROUND_COUNT_OPTIONS[0]);
  const [systemRoundOne, setSystemRoundOne] = useState(FIRST_ROUND_SYSTEM_OPTIONS[0]);

  const [prizeFirst, setPrizeFirst] = useState("");
  const [prizeSecond, setPrizeSecond] = useState("");
  const [prizeThird, setPrizeThird] = useState("");
  const [prizeFourth, setPrizeFourth] = useState("");
  const [prizeFiveToEight, setPrizeFiveToEight] = useState("");
  const [prizeNineToSixteen, setPrizeNineToSixteen] = useState("");
  const [prizeSeventeenToThirtyTwo, setPrizeSeventeenToThirtyTwo] = useState("");

  const [regOpenAt, setRegOpenAt] = useState("");
  const [regCloseAt, setRegCloseAt] = useState("");
  const [registrationFee, setRegistrationFee] = useState("");

  const [docs, setDocs] = useState(DEFAULT_DOCS);
  const [uploadingDoc, setUploadingDoc] = useState<UploadTarget | null>(null);

  const [provinces, setProvinces] = useState<RegionItem[]>([]);
  const [cities, setCities] = useState<RegionItem[]>([]);
  const [regionsError, setRegionsError] = useState<string | null>(null);
  const [regionsLoading, setRegionsLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(true);
  const [allowPublicLiveReport, setAllowPublicLiveReport] = useState(true);

  const isEditMode = Boolean(initialSlug?.trim());
  const showProvince = organizer === "PENGPROV PORDI" || organizer === "PENGKAB/PENGKOT PORDI";
  const showCity = organizer === "PENGKAB/PENGKOT PORDI";
  const showRoundTwo = roundCount === "Dua Babak";

  const selectedProvince = useMemo(() => provinces.find((item) => item.id === provinceId) ?? null, [provinceId, provinces]);
  const selectedCity = useMemo(() => cities.find((item) => item.id === cityId) ?? null, [cityId, cities]);
  const slugPreview = useMemo(() => slugify(name), [name]);

  useEffect(() => {
    let isMounted = true;

    async function loadProvinces() {
      setRegionsLoading(true);
      setRegionsError(null);
      try {
        const res = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
        const data = (await res.json()) as RegionItem[];
        if (!res.ok) {
          throw new Error("Gagal memuat data provinsi.");
        }
        if (isMounted) {
          setProvinces(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setRegionsError("Data provinsi gagal dimuat. Coba refresh halaman.");
        }
      } finally {
        if (isMounted) {
          setRegionsLoading(false);
        }
      }
    }

    void loadProvinces();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!provinceId) {
      setCities([]);
      setCityId("");
      return;
    }

    let isMounted = true;

    async function loadCities() {
      setRegionsLoading(true);
      setRegionsError(null);
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
        const data = (await res.json()) as RegionItem[];
        if (!res.ok) {
          throw new Error("Gagal memuat data kabupaten/kota.");
        }
        if (isMounted) {
          setCities(Array.isArray(data) ? data : []);
          setCityId((prev) => {
            if (!prev) return "";
            return (Array.isArray(data) ? data : []).some((item) => item.id === prev) ? prev : "";
          });
        }
      } catch {
        if (isMounted) {
          setRegionsError("Data kabupaten/kota gagal dimuat. Coba pilih ulang provinsi.");
        }
      } finally {
        if (isMounted) {
          setRegionsLoading(false);
        }
      }
    }

    void loadCities();

    return () => {
      isMounted = false;
    };
  }, [provinceId]);

  useEffect(() => {
    const slugForEdit = initialSlug ?? "";
    if (!isEditMode || !slugForEdit) return;
    let isMounted = true;

    async function loadEventForEdit() {
      setLoadingEdit(true);
      setMessage(null);
      setIsError(false);

      try {
        const response = await fetch(`/api/admin/events?slug=${encodeURIComponent(slugForEdit)}`, {
          cache: "no-store",
        });
        const data = (await response.json().catch(() => ({}))) as EventFetchResponse;

        if (!response.ok || !data.ok || !data.event) {
          throw new Error(data.error ?? "Gagal memuat data pertandingan untuk mode edit.");
        }

        if (!isMounted) return;

        const event = data.event;
        const settings = data.settings ?? {};
        const profile = data.profile;
        const identity = settings.identity ?? {};
        const kategori = settings.kategori ?? {};
        const hadiah = settings.hadiah ?? {};
        const pendaftaran = settings.pendaftaran ?? {};
        const dokumen = settings.dokumen ?? {};

        const docsFromRows: Record<UploadTarget, string> = { ...DEFAULT_DOCS };
        for (const row of data.documents ?? []) {
          docsFromRows[row.doc_type] = row.storage_path;
        }

        setName(event.name ?? "");
        setStatus(event.status ?? "draft");
        setAllowPublicRegistration(event.allow_public_registration ?? true);
        setAllowPublicLiveReport(event.allow_public_live_report ?? true);

        setTournamentLevel(
          profile?.tournament_level ??
            identity.tingkatan_pertandingan ??
            TOURNAMENT_LEVEL_OPTIONS[0],
        );
        setOrganizer(
          profile?.organizer_level ??
            identity.penyelenggara_pertandingan ??
            ORGANIZER_OPTIONS[0],
        );
        setProvinceId(identity.provinsi_id ?? "");
        setCityId(identity.kabupaten_kota_id ?? "");
        setEventStartAt(
          toDateTimeLocalValue(profile?.event_start_at ?? event.match_start_at ?? identity.tanggal_mulai_pertandingan),
        );
        setEventEndAt(
          toDateTimeLocalValue(profile?.event_end_at ?? event.tournament_end_at ?? identity.tanggal_berakhir_pertandingan),
        );
        setVenueAddress(profile?.venue_address ?? identity.alamat_tempat_pertandingan ?? "");
        setVenueMapUrl(profile?.venue_map_url ?? identity.link_map_lokasi_pertandingan ?? "");

        setEventNumberCategory(
          profile?.event_number_category ?? kategori.nomor_pertandingan ?? EVENT_NUMBER_OPTIONS[0],
        );
        setCapacityTotal(profile?.participant_total ?? event.capacity_total ?? kategori.jumlah_peserta ?? 0);
        setRoundCount(
          profile?.round_count === 2 || kategori.jumlah_babak === "Dua Babak" ? "Dua Babak" : "Satu Babak",
        );
        setSystemRoundOne(profile?.round_one_system ?? kategori.sistem_babak_pertama ?? FIRST_ROUND_SYSTEM_OPTIONS[0]);

        setPrizeFirst(numberToDigitString(profile?.prize_1) || extractDigits(hadiah.juara_i ?? ""));
        setPrizeSecond(numberToDigitString(profile?.prize_2) || extractDigits(hadiah.juara_ii ?? ""));
        setPrizeThird(numberToDigitString(profile?.prize_3) || extractDigits(hadiah.juara_iii ?? ""));
        setPrizeFourth(numberToDigitString(profile?.prize_4) || extractDigits(hadiah.juara_iv ?? ""));
        setPrizeFiveToEight(numberToDigitString(profile?.prize_5_8) || extractDigits(hadiah.juara_v_viii ?? ""));
        setPrizeNineToSixteen(numberToDigitString(profile?.prize_9_16) || extractDigits(hadiah.juara_ix_xvi ?? ""));
        setPrizeSeventeenToThirtyTwo(
          numberToDigitString(profile?.prize_17_32) || extractDigits(hadiah.juara_xvii_xxxii ?? ""),
        );

        setRegOpenAt(
          toDateTimeLocalValue(profile?.registration_open_at ?? event.reg_open_at ?? pendaftaran.tanggal_dibuka_pendaftaran),
        );
        setRegCloseAt(
          toDateTimeLocalValue(profile?.registration_close_at ?? event.reg_close_at ?? pendaftaran.tanggal_ditutup_pendaftaran),
        );
        setRegistrationFee(
          numberToDigitString(profile?.registration_fee) || extractDigits(pendaftaran.biaya_pendaftaran ?? ""),
        );

        setDocs({
          org_recommendation: dokumen.surat_rekomendasi_organisasi ?? docsFromRows.org_recommendation ?? "",
          public_permit: dokumen.surat_izin_keramaian ?? docsFromRows.public_permit ?? "",
          flyer_16_9_1: dokumen.flayer_1_16_9 ?? docsFromRows.flyer_16_9_1 ?? "",
          flyer_16_9_2: dokumen.flayer_2_16_9 ?? docsFromRows.flyer_16_9_2 ?? "",
          flyer_9_16_1: dokumen.flayer_3_9_16 ?? docsFromRows.flyer_9_16_1 ?? "",
          flyer_9_16_2: dokumen.flayer_4_9_16 ?? docsFromRows.flyer_9_16_2 ?? "",
        });
      } catch (error) {
        if (!isMounted) return;
        setIsError(true);
        setMessage(error instanceof Error ? error.message : "Gagal memuat data edit pertandingan.");
      } finally {
        if (isMounted) {
          setLoadingEdit(false);
        }
      }
    }

    void loadEventForEdit();

    return () => {
      isMounted = false;
    };
  }, [initialSlug, isEditMode]);

  async function uploadDocument(target: UploadTarget, file: File) {
    setUploadingDoc(target);
    setMessage(null);
    setIsError(false);

    try {
      const body = new FormData();
      body.append("target", target);
      body.append("file", file);

      const response = await fetch("/api/admin/event-documents/upload", {
        method: "POST",
        body,
      });
      const data = (await response.json().catch(() => ({}))) as UploadResponse;

      if (!response.ok || !data.ok || !data.path) {
        setIsError(true);
        setMessage(data.error ?? "Gagal upload dokumen pertandingan.");
        return;
      }

      setDocs((prev) => ({ ...prev, [target]: data.path ?? "" }));
      setMessage(`Upload berhasil: ${formatUploadedName(data.path ?? "")}`);
    } finally {
      setUploadingDoc(null);
    }
  }

  function onChooseFile(target: UploadTarget) {
    return async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      await uploadDocument(target, file);
      event.target.value = "";
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setIsError(false);

    try {
      const payload = {
        slug: isEditMode && initialSlug ? initialSlug : slugPreview,
        name,
        description: `${name}${organizer ? ` - Penyelenggara: ${organizer}` : ""}`,
        status,
        capacity_total: capacityTotal,
        match_start_at: eventStartAt || null,
        tournament_end_at: eventEndAt || null,
        reg_open_at: regOpenAt || null,
        reg_close_at: regCloseAt || null,
        allow_public_registration: allowPublicRegistration,
        allow_public_live_report: allowPublicLiveReport,
        meta: {
          identity: {
            nama_pertandingan: name,
            tingkatan_pertandingan: tournamentLevel,
            penyelenggara_pertandingan: organizer,
            provinsi_id: showProvince ? provinceId : null,
            provinsi: showProvince ? selectedProvince?.name ?? null : null,
            kabupaten_kota_id: showCity ? cityId : null,
            kabupaten_kota: showCity ? selectedCity?.name ?? null : null,
            tanggal_mulai_pertandingan: eventStartAt || null,
            tanggal_berakhir_pertandingan: eventEndAt || null,
            alamat_tempat_pertandingan: venueAddress,
            link_map_lokasi_pertandingan: venueMapUrl,
          },
          kategori: {
            nomor_pertandingan: eventNumberCategory,
            jumlah_peserta: capacityTotal,
            jumlah_babak: roundCount,
            sistem_babak_pertama: systemRoundOne,
            sistem_babak_kedua: showRoundTwo ? SECOND_ROUND_SYSTEM : null,
          },
          hadiah: {
            juara_i: formatRupiah(prizeFirst),
            juara_ii: formatRupiah(prizeSecond),
            juara_iii: formatRupiah(prizeThird),
            juara_iv: formatRupiah(prizeFourth),
            juara_v_viii: formatRupiah(prizeFiveToEight),
            juara_ix_xvi: formatRupiah(prizeNineToSixteen),
            juara_xvii_xxxii: formatRupiah(prizeSeventeenToThirtyTwo),
          },
          pendaftaran: {
            tanggal_dibuka_pendaftaran: regOpenAt || null,
            tanggal_ditutup_pendaftaran: regCloseAt || null,
            biaya_pendaftaran: formatRupiah(registrationFee),
          },
          dokumen: {
            surat_rekomendasi_organisasi: docs.org_recommendation,
            surat_izin_keramaian: docs.public_permit,
            flayer_1_16_9: docs.flyer_16_9_1,
            flayer_2_16_9: docs.flyer_16_9_2,
            flayer_3_9_16: docs.flyer_9_16_1,
            flayer_4_9_16: docs.flyer_9_16_2,
          },
        },
      };

      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as CreateEventResponse;

      if (!response.ok || !data.ok) {
        setIsError(true);
        setMessage(data.error ?? "Gagal membuat pertandingan.");
        return;
      }

      const savedSlug = data.slug || slugPreview || "-";
      const isUpdated = data.action === "updated";
      setMessage(
        isUpdated
          ? `Pertandingan berhasil diupdate. Slug: ${savedSlug}`
          : `Pertandingan berhasil dibuat. Slug: ${savedSlug}`,
      );

      if (!isUpdated) {
        setName("");
        setStatus("draft");
        setAllowPublicRegistration(true);
        setAllowPublicLiveReport(true);
        setTournamentLevel(TOURNAMENT_LEVEL_OPTIONS[0]);
        setOrganizer(ORGANIZER_OPTIONS[0]);
        setProvinceId("");
        setCityId("");
        setEventStartAt("");
        setEventEndAt("");
        setVenueAddress("");
        setVenueMapUrl("");
        setEventNumberCategory(EVENT_NUMBER_OPTIONS[0]);
        setCapacityTotal(0);
        setRoundCount(ROUND_COUNT_OPTIONS[0]);
        setSystemRoundOne(FIRST_ROUND_SYSTEM_OPTIONS[0]);
        setPrizeFirst("");
        setPrizeSecond("");
        setPrizeThird("");
        setPrizeFourth("");
        setPrizeFiveToEight("");
        setPrizeNineToSixteen("");
        setPrizeSeventeenToThirtyTwo("");
        setRegOpenAt("");
        setRegCloseAt("");
        setRegistrationFee("");
        setDocs(DEFAULT_DOCS);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel">
      <form className="form-grid" onSubmit={onSubmit}>
        <fieldset className="event-section">
          <legend>A. IDENTITAS PERTANDINGAN</legend>

          <label>
            Nama Pertandingan
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Jakarta Domino Tournament Seri 2"
              required
            />
          </label>

          <label>
            Tingkatan Pertandingan
            <select value={tournamentLevel} onChange={(event) => setTournamentLevel(event.target.value)} required>
              {TOURNAMENT_LEVEL_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Penyelenggara Pertandingan
            <select value={organizer} onChange={(event) => setOrganizer(event.target.value)} required>
              {ORGANIZER_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {showProvince ? (
            <label>
              Provinsi
              <select value={provinceId} onChange={(event) => setProvinceId(event.target.value)} required>
                <option value="">Pilih Provinsi</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {showCity ? (
            <label>
              Kabupaten/Kota
              <select value={cityId} onChange={(event) => setCityId(event.target.value)} required>
                <option value="">Pilih Kabupaten/Kota</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label>
            Tanggal Mulai Pertandingan
            <input type="datetime-local" value={eventStartAt} onChange={(event) => setEventStartAt(event.target.value)} />
          </label>

          <label>
            Tanggal Berakhir Pertandingan
            <input type="datetime-local" value={eventEndAt} onChange={(event) => setEventEndAt(event.target.value)} />
          </label>

          <label>
            Alamat Tempat Pertandingan
            <input
              type="text"
              value={venueAddress}
              onChange={(event) => setVenueAddress(event.target.value)}
              placeholder="Alamat lengkap lokasi pertandingan"
            />
          </label>

          <label>
            Link Map Lokasi Pertandingan
            <input
              type="url"
              value={venueMapUrl}
              onChange={(event) => setVenueMapUrl(event.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </label>

          <label>
            Preview Slug Otomatis
            <input type="text" value={slugPreview} readOnly />
          </label>
        </fieldset>

        <fieldset className="event-section">
          <legend>B. CATEGORI PERTANDINGAN</legend>

          <label>
            Nomor Pertandingan
            <select value={eventNumberCategory} onChange={(event) => setEventNumberCategory(event.target.value)} required>
              {EVENT_NUMBER_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Jumlah Peserta
            <input
              type="number"
              min={0}
              value={capacityTotal}
              onChange={(event) => setCapacityTotal(Number(event.target.value || 0))}
              required
            />
          </label>

          <label>
            Jumlah Babak
            <select value={roundCount} onChange={(event) => setRoundCount(event.target.value)} required>
              {ROUND_COUNT_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sistem Babak Pertama
            <select value={systemRoundOne} onChange={(event) => setSystemRoundOne(event.target.value)} required>
              {FIRST_ROUND_SYSTEM_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {showRoundTwo ? (
            <label>
              Sistem Babak Kedua
              <input type="text" value={SECOND_ROUND_SYSTEM} readOnly />
            </label>
          ) : null}
        </fieldset>

        <fieldset className="event-section">
          <legend>C. HADIAH PERTANDINGAN</legend>

          <label>
            Juara I
            <input type="text" inputMode="numeric" value={formatRupiah(prizeFirst)} onChange={readFileToDigits(setPrizeFirst)} />
          </label>
          <label>
            Juara II
            <input type="text" inputMode="numeric" value={formatRupiah(prizeSecond)} onChange={readFileToDigits(setPrizeSecond)} />
          </label>
          <label>
            Juara III
            <input type="text" inputMode="numeric" value={formatRupiah(prizeThird)} onChange={readFileToDigits(setPrizeThird)} />
          </label>
          <label>
            Juara IV
            <input type="text" inputMode="numeric" value={formatRupiah(prizeFourth)} onChange={readFileToDigits(setPrizeFourth)} />
          </label>
          <label>
            Juara V - VIII
            <input
              type="text"
              inputMode="numeric"
              value={formatRupiah(prizeFiveToEight)}
              onChange={readFileToDigits(setPrizeFiveToEight)}
            />
          </label>
          <label>
            Juara IX - XVI
            <input
              type="text"
              inputMode="numeric"
              value={formatRupiah(prizeNineToSixteen)}
              onChange={readFileToDigits(setPrizeNineToSixteen)}
            />
          </label>
          <label>
            Juara XVII - XXXII
            <input
              type="text"
              inputMode="numeric"
              value={formatRupiah(prizeSeventeenToThirtyTwo)}
              onChange={readFileToDigits(setPrizeSeventeenToThirtyTwo)}
            />
          </label>
        </fieldset>

        <fieldset className="event-section">
          <legend>D. PENDAFTARAN</legend>

          <label>
            Tanggal Dibuka Pendaftaran
            <input type="datetime-local" value={regOpenAt} onChange={(event) => setRegOpenAt(event.target.value)} />
          </label>

          <label>
            Tanggal Ditutup Pendaftaran
            <input type="datetime-local" value={regCloseAt} onChange={(event) => setRegCloseAt(event.target.value)} />
          </label>

          <label>
            Biaya Pendaftaran
            <input
              type="text"
              inputMode="numeric"
              value={formatRupiah(registrationFee)}
              onChange={readFileToDigits(setRegistrationFee)}
            />
          </label>
        </fieldset>

        <fieldset className="event-section">
          <legend>E. DOKUMEN PERTANDINGAN</legend>

          {DOCUMENTS.map((item) => {
            const inputId = `doc-upload-${item.target}`;
            return (
              <div key={item.target} className="cms-asset-row">
                <span>{item.label}</span>
                <div className="cms-upload-actions">
                  <input
                    id={inputId}
                    className="cms-file-input"
                    type="file"
                    accept={item.accept}
                    onChange={onChooseFile(item.target)}
                  />
                  <label htmlFor={inputId} className="cms-upload-btn">
                    {uploadingDoc === item.target ? "Uploading..." : "Upload File"}
                  </label>
                  <span>{formatUploadedName(docs[item.target])}</span>
                </div>
                {item.note ? <small>{item.note}</small> : null}
              </div>
            );
          })}
        </fieldset>

        <button type="submit" disabled={saving || uploadingDoc !== null || regionsLoading}>
          {saving ? "Menyimpan..." : "Simpan Event"}
        </button>

        {regionsError ? <p className="err">{regionsError}</p> : null}
        {message ? <p className={isError ? "err" : "ok"}>{message}</p> : null}
      </form>
    </section>
  );
}
