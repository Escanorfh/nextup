import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, image, url }) {
    const siteTitle = 'Next Up - Modern Marketplace';
    const defaultDescription = 'Next Up is the best place to buy and sell electronics, fashion, furniture, and more. Join our community today!';
    const defaultKeywords = 'marketplace, buy, sell, electronics, fashion, egypt, shopping';
    const siteUrl = window.location.origin;
    const defaultImage = `${siteUrl}/logo.png`; // Ensure you have a default OG image if possible

    const metaTitle = title ? `${title} | Next Up` : siteTitle;
    const metaDescription = description || defaultDescription;
    const metaKeywords = keywords || defaultKeywords;
    const metaImage = image || defaultImage;
    const metaUrl = url || window.location.href;

    return (
        <Helmet>
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={metaUrl} />
            <meta property="twitter:title" content={metaTitle} />
            <meta property="twitter:description" content={metaDescription} />
            <meta property="twitter:image" content={metaImage} />
        </Helmet>
    );
}
