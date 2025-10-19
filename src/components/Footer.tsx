import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-heading text-lg font-bold">Kromium Health</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Smart digital healthcare platform connecting patients with verified doctors for quality care.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/doctors" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/signin" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* For Doctors */}
          <div>
            <h3 className="font-heading font-semibold mb-4">For Doctors</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/signup" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Join as Doctor
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Doctor Resources
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:team@kromiumhealth.com" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  team@kromiumhealth.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a href="tel:+2347034662458" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  +234 (0) 703 466 2458
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Kromium Health. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground text-center md:text-right">
              Data protected under NDPR & HIPAA guidelines
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
