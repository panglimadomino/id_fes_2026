"use client";

import { FormEvent, useState } from "react";

type CreateEventResponse = {
  ok?: boolean;
  error?: string;
  id?: string;
};

export default function CreateEventForm() {
  const [name, setName] = useState("");
  const [identityLevel, setIdentityLevel] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [eventStartAt, setEventStartAt] = useState("");
  const [eventEndAt, setEventEndAt] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueMapUrl, setVenueMapUrl] = useState("");

  const [categoryLevel, setCategoryLevel] = useState("");
  const [capacityTotal, setCapacityTotal] = useState(0);
  const [systemRoundOne, setSystemRoundOne] = useState("");
  const [systemRoundTwo, setSystemRoundTwo] = useState("");

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

  const [docOrgRecommendation, setDocOrgRecommendation] = useState("");
  const [docPublicPermit, setDocPublicPermit] = useState("");
  const [flyerOne, setFlyerOne] = useState("");
  const [flyerTwo, setFlyerTwo] = useState("");
  const [flyerThree, setFlyerThree] = useState("");
  const [flyerFour, setFlyerFour] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
            tingkat_pertandingan: identityLevel,
            penyelenggara_pertandingan: organizer,
            alamat_tempat_pertandingan: venueAddress,
            map_lokasi_pertandingan: venueMapUrl,
          },
          kategori: {
            tingkatan_pertandingan: categoryLevel,
            jumlah_peserta: capacityTotal,
            sistem_babak_pertama: systemRoundOne,
            sistem_babak_kedua: systemRoundTwo,
          },
          hadiah: {
            juara_i: prizeFirst,
            juara_ii: prizeSecond,
            juara_iii: prizeThird,
            juara_iv: prizeFourth,
            juara_v_viii: prizeFiveToEight,
            juara_ix_xvi: prizeNineToSixteen,
            juara_xvii_xxxii: prizeSeventeenToThirtyTwo,
          },
          pendaftaran: {
            tanggal_dibuka_pendaftaran: regOpenAt || null,
            tanggal_ditutup_pendaftaran: regCloseAt || null,
            biaya_pendaftaran: registrationFee,
          },
          dokumen: {
            surat_rekomendasi_organisasi: docOrgRecommendation,
            surat_izin_keramaian: docPublicPermit,
            flayer_1_16_9: flyerOne,
            flayer_2_16_9: flyerTwo,
            flayer_3_9_16: flyerThree,
            flayer_4_9_16: flyerFour,
          },
        },
      };

      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as CreateEventResponse;

      if (!res.ok || !data.ok) {
        setIsError(true);
        setMessage(data.error ?? "Gagal membuat event.");
        return;
      }

      setMessage("Event berhasil dibuat.");
      setName("");
      setIdentityLevel("");
      setOrganizer("");
      setEventStartAt("");
      setEventEndAt("");
      setVenueAddress("");
      setVenueMapUrl("");
      setCategoryLevel("");
      setCapacityTotal(0);
      setSystemRoundOne("");
      setSystemRoundTwo("");
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
      setDocOrgRecommendation("");
      setDocPublicPermit("");
      setFlyerOne("");
      setFlyerTwo("");
      setFlyerThree("");
      setFlyerFour("");
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
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Jakarta Domino Tournament Seri 2"
              required
            />
          </label>
          <label>
            Tingkatan Pertandingan
            <input
              type="text"
              value={identityLevel}
              onChange={(e) => setIdentityLevel(e.target.value)}
              placeholder="Contoh: Nasional"
            />
          </label>
          <label>
            Penyelenggara Petandingan
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="Nama penyelenggara"
            />
          </label>
          <label>
            Tanggal Mulai Pertandingan
            <input type="datetime-local" value={eventStartAt} onChange={(e) => setEventStartAt(e.target.value)} />
          </label>
          <label>
            Tanggal Berakhir Perandingan
            <input type="datetime-local" value={eventEndAt} onChange={(e) => setEventEndAt(e.target.value)} />
          </label>
          <label>
            Alamat Tempat Pertandingan
            <input
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Alamat lengkap lokasi pertandingan"
            />
          </label>
          <label>
            Map Lokasi Pertandingan
            <input
              type="url"
              value={venueMapUrl}
              onChange={(e) => setVenueMapUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </label>
        </fieldset>

        <fieldset className="event-section">
          <legend>B. CATEGORI PERTANDINGAN</legend>
          <label>
            Tingakatan Pertandingan
            <input
              type="text"
              value={categoryLevel}
              onChange={(e) => setCategoryLevel(e.target.value)}
              placeholder="Contoh: Open / Umum"
            />
          </label>
          <label>
            Jumlah Peserta
            <input
              type="number"
              min={0}
              value={capacityTotal}
              onChange={(e) => setCapacityTotal(Number(e.target.value))}
              required
            />
          </label>
          <label>
            Sistem Babak Pertama
            <input
              type="text"
              value={systemRoundOne}
              onChange={(e) => setSystemRoundOne(e.target.value)}
              placeholder="Contoh: Round Robin"
            />
          </label>
          <label>
            Sitem Babak Kedua
            <input
              type="text"
              value={systemRoundTwo}
              onChange={(e) => setSystemRoundTwo(e.target.value)}
              placeholder="Contoh: Single Elimination"
            />
          </label>
        </fieldset>

        <fieldset className="event-section">
          <legend>C. HADIAH PERTANDINGAN</legend>
          <label>
            Juara I
            <input type="text" value={prizeFirst} onChange={(e) => setPrizeFirst(e.target.value)} />
          </label>
          <label>
            Juara II
            <input type="text" value={prizeSecond} onChange={(e) => setPrizeSecond(e.target.value)} />
          </label>
          <label>
            Juara III
            <input type="text" value={prizeThird} onChange={(e) => setPrizeThird(e.target.value)} />
          </label>
          <label>
            Juara IV
            <input type="text" value={prizeFourth} onChange={(e) => setPrizeFourth(e.target.value)} />
          </label>
          <label>
            Juara V - VIII
            <input type="text" value={prizeFiveToEight} onChange={(e) => setPrizeFiveToEight(e.target.value)} />
          </label>
          <label>
            Juara IX - XVI
            <input type="text" value={prizeNineToSixteen} onChange={(e) => setPrizeNineToSixteen(e.target.value)} />
          </label>
          <label>
            Juara XVII - XXXII
            <input
              type="text"
              value={prizeSeventeenToThirtyTwo}
              onChange={(e) => setPrizeSeventeenToThirtyTwo(e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="event-section">
          <legend>D. PENDAFTARAN</legend>
          <label>
            Tanggal Dibuka Pendaftaran
            <input type="datetime-local" value={regOpenAt} onChange={(e) => setRegOpenAt(e.target.value)} />
          </label>
          <label>
            Tanggal Ditutup Pendaftaran
            <input type="datetime-local" value={regCloseAt} onChange={(e) => setRegCloseAt(e.target.value)} />
          </label>
          <label>
            Biaya Pendaftaran
            <input
              type="text"
              value={registrationFee}
              onChange={(e) => setRegistrationFee(e.target.value)}
              placeholder="Contoh: Rp 250.000 / team"
            />
          </label>
        </fieldset>

        <fieldset className="event-section">
          <legend>E. DOKUMEN PERTANDINGAN</legend>
          <label>
            Surat Rekomendasi Organisasi
            <input
              type="text"
              value={docOrgRecommendation}
              onChange={(e) => setDocOrgRecommendation(e.target.value)}
              placeholder="URL / nama file"
            />
          </label>
          <label>
            Surat Izin Keramaian
            <input
              type="text"
              value={docPublicPermit}
              onChange={(e) => setDocPublicPermit(e.target.value)}
              placeholder="URL / nama file"
            />
          </label>
          <label>
            Flayer 1 (16 : 9)
            <input type="text" value={flyerOne} onChange={(e) => setFlyerOne(e.target.value)} placeholder="URL / nama file" />
          </label>
          <label>
            Flayer 2 (16 : 9)
            <input type="text" value={flyerTwo} onChange={(e) => setFlyerTwo(e.target.value)} placeholder="URL / nama file" />
          </label>
          <label>
            Flayer 3 (9 : 16)
            <input type="text" value={flyerThree} onChange={(e) => setFlyerThree(e.target.value)} placeholder="URL / nama file" />
          </label>
          <label>
            Flayer 4 (9 : 16)
            <input type="text" value={flyerFour} onChange={(e) => setFlyerFour(e.target.value)} placeholder="URL / nama file" />
          </label>
        </fieldset>

        <button type="submit" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Event"}
        </button>
        {message ? <p className={isError ? "err" : "ok"}>{message}</p> : null}
      </form>
    </section>
  );
}
