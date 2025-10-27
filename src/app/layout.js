import './globals.css';
import './style.css'; // global styles for the app
import AppLayout from '../components/AppLayout';
export const metadata = {
  title: 'IF/Platform by Lotanna',
  description: 'Interactive Fiction Dashboard and Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}