"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type CreateEventResponse = {
  ok?: boolean;
  error?: string;
  id?: string;
};

type UploadResponse = {
  ok?: boolean;
  error?: string;
  path?: string;
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

export default function CreateEventForm() {
  const [name, setName] = useState("");
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
          setCityId("");
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
        name,
        description: `${name}${organizer ? ` - Penyelenggara: ${organizer}` : ""}`,
        capacity_total: capacityTotal,
        match_start_at: eventStartAt || null,
        tournament_end_at: eventEndAt || null,
        reg_open_at: regOpenAt || null,
        reg_close_at: regCloseAt || null,
        allow_public_registration: true,
        allow_public_live_report: true,
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

      setMessage(`Pertandingan berhasil dibuat. Slug: ${slugPreview || "-"}`);
      setName("");
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
