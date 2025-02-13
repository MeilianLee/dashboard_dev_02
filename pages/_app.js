import { useRouter } from 'next/router';
import "@styles/globals.scss";

export default function App({ Component, pageProps }) {
    const router = useRouter();
    // only apply the these styles css for dashboard_page
    if (router.pathname === '/dashboard_page') {
        // Import styles and scripts specific to dashboard_page
        import('@styles/dashboard.css');
        import('@styles/dashboard_timeline.css');
        import('@styles/map.css');
    }

    return <Component {...pageProps} />;
}