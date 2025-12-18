import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">
                GovResolve<span className="text-secondary">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground/80">
              AI-powered complaint management for transparent and efficient governance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground/80">
              <li><Link to="/submit" className="hover:text-secondary transition-colors">Submit Complaint</Link></li>
              <li><Link to="/track" className="hover:text-secondary transition-colors">Track Status</Link></li>
              <li><Link to="/dashboard" className="hover:text-secondary transition-colors">Dashboard</Link></li>
              <li><Link to="/analytics" className="hover:text-secondary transition-colors">Analytics</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground/80">
              <li><span className="hover:text-secondary transition-colors cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-secondary transition-colors cursor-pointer">FAQs</span></li>
              <li><span className="hover:text-secondary transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-secondary transition-colors cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground/80">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                support@govresolve.ai
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                1800-GOV-HELP
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Government Complex, City
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-muted/20 text-center text-sm text-muted-foreground/60">
          <p>© {new Date().getFullYear()} GovResolveAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
