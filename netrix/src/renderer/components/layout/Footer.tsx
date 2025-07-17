export default function Footer() {
  const handleStrataLinkClick = () => {
    window.api.shell.openExternal('https://github.com/StrataBytes');
  };

  return (
    <footer className="footer">
      <div className="footer-left">
        <span>Netrix v1.0.4</span>
      </div>
      <div className="footer-right">
        <span onClick={handleStrataLinkClick} style={{ cursor: 'pointer' }}>
          @StrataBytes
        </span>
      </div>
    </footer>
  );
}
