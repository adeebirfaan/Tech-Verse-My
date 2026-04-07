export function Footer() {
  return (
    <footer className="border-t border-border py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            Tech Verse My
          </span>
          <p className="text-muted-foreground text-sm mt-2">
            Supporting local Malaysian tech, one app at a time.
          </p>
        </div>
        
        <div className="flex space-x-6 text-sm text-muted-foreground">
          <a href="#home" className="hover:text-foreground transition-colors">Home</a>
          <a href="#explore" className="hover:text-foreground transition-colors">Explore</a>
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
        </div>
        
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Tech Verse My. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
