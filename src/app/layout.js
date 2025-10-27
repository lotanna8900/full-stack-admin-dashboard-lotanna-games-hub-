import './globals.css';
import './style.css'; // global styles for the app
import AppLayout from '../components/AppLayout';
export const metadata = {
  title: 'Lota Labs',
  description: 'Interactive Fiction and Full-Stack Development. The rose that grew from concrete. 🌹',
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