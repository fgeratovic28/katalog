import React from "react";
import { Header } from "@/components/catalog/Header";
import { Footer } from "@/components/catalog/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Politika privatnosti</h1>
            <p className="text-muted-foreground">Poslednje ažuriranje: {new Date().toLocaleDateString('sr-RS')}</p>
          </div>

          <div className="space-y-6 text-foreground/90">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Uvod</h2>
              <p>
                Vaša privatnost nam je veoma važna. Ova Politika privatnosti objašnjava kako Original Store prikuplja,
                koristi i štiti vaše lične podatke kada posetite naš sajt ili izvršite kupovinu.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">2. Podaci koje prikupljamo</h2>
              <p>
                Prilikom poručivanja proizvoda, možemo prikupiti sledeće podatke:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Ime i prezime</li>
                <li>Adresa za isporuku</li>
                <li>Broj telefona</li>
                <li>Email adresa</li>
              </ul>
              <p>
                Ovi podaci su nam neophodni kako bismo obradili vašu porudžbinu i isporučili robu na željenu adresu.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">3. Upotreba podataka</h2>
              <p>
                Prikupljene podatke koristimo isključivo u sledeće svrhe:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Obrada i isporuka porudžbina</li>
                <li>Komunikacija sa vama u vezi sa statusom porudžbine</li>
                <li>Rešavanje reklamacija i povraćaja robe</li>
                <li>Poboljšanje korisničkog iskustva na našem sajtu</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">4. Zaštita podataka</h2>
              <p>
                Preduzimamo odgovarajuće tehničke i organizacione mere kako bismo zaštitili vaše lične podatke od
                neovlašćenog pristupa, gubitka ili zloupotrebe. Vaši podaci se čuvaju u sigurnom okruženju i dostupni su
                samo zaposlenima kojima su neophodni za obavljanje posla.
              </p>
              <p>
                Vaše lične podatke ne delimo sa trećim licima, osim sa kurirskim službama u meri u kojoj je to neophodno
                za isporuku paketa.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">5. Kolačići (Cookies)</h2>
              <p>
                Naš sajt koristi kolačiće kako bi vam pružio bolje korisničko iskustvo. Kolačići su male tekstualne datoteke
                koje se čuvaju na vašem uređaju. Možete podesiti svoj pretraživač da odbije kolačiće, ali u tom slučaju
                neki delovi sajta možda neće funkcionisati ispravno.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">6. Vaša prava</h2>
              <p>
                Imate pravo da zatražite uvid u podatke koje imamo o vama, kao i da zatražite njihovu ispravku ili brisanje.
                Ukoliko imate bilo kakvih pitanja u vezi sa našom politikom privatnosti, slobodno nas kontaktirajte.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
