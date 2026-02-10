import React from "react";
import { Header } from "@/components/catalog/Header";
import { Footer } from "@/components/catalog/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Uslovi korišćenja</h1>
            <p className="text-muted-foreground">Poslednje ažuriranje: {new Date().toLocaleDateString('sr-RS')}</p>
          </div>

          <div className="space-y-6 text-foreground/90">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Opšte odredbe</h2>
              <p>
                Dobrodošli na Original Store. Ovi uslovi korišćenja definišu pravila i propise za korišćenje naše internet prodavnice.
                Pristupanjem ovom sajtu pretpostavljamo da prihvatate ove uslove i odredbe u potpunosti.
                Nemojte nastaviti da koristite Original Store ako ne prihvatate sve uslove i odredbe navedene na ovoj stranici.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">2. Način isporuke</h2>
              <p>
                Isporuka se vrši putem kurirske službe na teritoriji Republike Srbije. 
                Rok za isporuku je obično 2-5 radnih dana od trenutka potvrde porudžbine.
                Troškove dostave snosi kupac, osim ako nije drugačije naznačeno u okviru posebnih akcija.
                Kurirska služba će vas kontaktirati pre isporuke putem telefona koji ste ostavili prilikom poručivanja.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">3. Pravo na povraćaj robe</h2>
              <p>
                U skladu sa Zakonom o zaštiti potrošača, kupac ima pravo da odustane od ugovora zaključenog na daljinu
                u roku od 14 dana od dana prijema robe, bez navođenja razloga.
              </p>
              <p>
                Da biste ostvarili pravo na odustanak, potrebno je da nas obavestite o svojoj odluci pre isteka roka od 14 dana.
                Proizvod koji vraćate mora biti nekorišćen, neoštećen i u originalnoj ambalaži, sa svim pripadajućim etiketama.
              </p>
              <p>
                Troškove vraćanja robe snosi kupac, osim u slučajevima kada je isporučeni proizvod neispravan ili pogrešan.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">4. Reklamacije</h2>
              <p>
                Ukoliko primetite da je paket oštećen prilikom preuzimanja, niste dužni da ga preuzmete.
                U slučaju da ste proizvod preuzeli i naknadno uvideli oštećenje ili nesaobraznost, molimo vas da nas kontaktirate
                u najkraćem roku kako bismo rešili problem (zamenili artikal ili izvršili povraćaj novca).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">5. Cene i plaćanje</h2>
              <p>
                Sve cene su izražene u dinarima (RSD). Zadržavamo pravo promene cena bez prethodne najave.
                Plaćanje se vrši pouzećem (gotovinski prilikom preuzimanja paketa).
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
