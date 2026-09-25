// ============================================================
// src/components/Navbar.tsx
//
// Top navigation bar — shows current page title and user info.
//
// Props:
//   pageTitle — the current page name shown in the breadcrumb
// ============================================================

interface NavbarProps {
  pageTitle: string;
}

export default function Navbar({ pageTitle }: NavbarProps) {
  return (
    <header className="app-navbar">
      {/* Left: page title */}
      <div className="navbar-breadcrumb">
        <h1 className="navbar-page-title">{pageTitle}</h1>
      </div>

      {/* Right: actions + user */}
      <div className="navbar-actions">
        {/* User Profile */}
        <div className="navbar-user">
          <div className="user-avatar">A</div>
          <div>
            <div className="user-name">Alpana Kakade</div>
            <div className="user-role">Frontend Developer</div>
          </div>
        </div>
      </div>
    </header>
  );
}
