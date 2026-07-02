export function Footer() {
  return (
    <footer className="border-t px-6 py-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} App. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <a href="#" className="transition-colors hover:text-foreground">
            License
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Documentation
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Support
          </a>
        </div>
      </div>
    </footer>
  )
}
