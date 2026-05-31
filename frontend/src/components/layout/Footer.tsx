export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Tourism Sri Lanka. All rights reserved.</p>
      </div>
    </footer>
  );
}
