export function Footer() {
  return (
    <footer className="border-t py-4">
      <div className="container px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} App. All rights reserved.
      </div>
    </footer>
  );
}
