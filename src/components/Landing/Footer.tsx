const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 py-12 text-center text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-6 md:flex-row md:justify-between">
        <div className="text-sm">
          &copy; {new Date().getFullYear()} Playbook Lite. All Rights Reserved.
        </div>
        <div className="flex gap-6 text-sm font-medium">
          <a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a>
          <a
            href="https://wa.me/255745780988"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400"
          >
            Contact Support via WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
