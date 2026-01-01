import './globals.css';
import './style.css'; 
import AppLayout from '../components/AppLayout';
import Web3Provider from '../components/Web3Provider'; 

export const metadata = {
  title: 'Lota Labs',
  description: 'Interactive Fiction Hub. The rose that grew from concrete. 🌹',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
            <AppLayout>
                {children}
            </AppLayout>
        </Web3Provider>
      </body>
    </html>
  );
}