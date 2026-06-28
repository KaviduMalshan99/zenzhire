export default function CVTemplatePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        html, body {
          background-color: #ffffff !important;
          color: #111827 !important;
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `}</style>
      {children}
    </>
  );
}
