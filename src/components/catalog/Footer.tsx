import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const whatsappLink = "https://wa.me/381611234567"; // Placeholder
  const instagramLink = "https://instagram.com"; // Placeholder

  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <span className="text-lg font-semibold">
                <span className="text-primary">ORIGINAL</span>
                <span className="text-foreground ml-1">STORE</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Sigurna kupovina i zagarantovan kvalitet.
            </p>
          </div>

          {/* Quick Info Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Informacije</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/uslovi-koriscenja" className="hover:text-foreground transition-colors">
                  Uslovi korišćenja
                </Link>
              </li>
              <li>
                <Link to="/politika-privatnosti" className="hover:text-foreground transition-colors">
                  Politika privatnosti
                </Link>
              </li>
              <li>
                <Link to="/provera" className="hover:text-foreground transition-colors">
                  Status porudžbine
                </Link>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground pt-2 border-t border-border mt-2">
              Zamena veličine je moguća u roku od 48h od prijema paketa.
            </p>
          </div>

          {/* Support & Socials Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Podrška</h4>
            <div className="flex flex-col items-start gap-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-colors flex items-center gap-2"
              >
                <span>Kontaktirajte nas</span>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="fill-current"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </a>
              
              <div className="flex items-center gap-4">
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-secondary hover:bg-muted rounded-full transition-colors text-foreground"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-secondary hover:bg-muted rounded-full transition-colors text-foreground"
                  aria-label="WhatsApp"
                >
                   <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Original Store. Sva prava zadržana.</p>
        </div>
      </div>
    </footer>
  );
}
