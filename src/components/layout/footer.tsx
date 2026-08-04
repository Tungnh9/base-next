export function Footer() {
  return (
    <footer className="flex shrink-0 items-center justify-center py-3">
      <div className="text-muted-foreground flex w-full flex-col items-center gap-2 text-center text-[15px] sm:flex-row sm:justify-between sm:text-left">
        <span>© {new Date().getFullYear()} App. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-foreground transition-colors">
            License
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Documentation
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  )
}
