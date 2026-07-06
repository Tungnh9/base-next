export function Footer() {
  return (
    <footer className="flex h-12 shrink-0 items-end justify-center py-3">
      <div className="text-muted-foreground flex w-full items-center justify-between text-[15px]">
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
