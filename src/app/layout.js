import './globals.css';
import './style.css'; 
import AppLayout from '../components/AppLayout';
export const metadata = {
  title: 'Lota Labs',
  description: 'Interactive Fiction Hub. The rose that grew from concrete. 🌹',
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