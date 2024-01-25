import Head from "next/head";

const DOMAIN = "";
const SITE_NAME = "Universal Music Library Transfer";

interface SEOProps {
    title: string;
    description: string;
}

export default function SEO({ title, description }: SEOProps) {
    return (
        <Head>
            <title key="title">{title}</title>
            <meta name="description" content={description} />
            <meta name="author" content="Tosin Ogunjobi"></meta>
            <meta name="keywords" content={`${SITE_NAME}`} />
            <meta key="og_type" property="og:type" content="website" />
            <meta key="og_title" property="og:title" content={title} />
            <meta key="og_description" property="og:description" content={description} />
            <meta key="og_locale" property="og:locale" content="en_US" />
            <meta key="og_site_name" property="og:site_name" content={SITE_NAME} />
            <meta key="og_url" property="og:url" content={DOMAIN} />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
            <link rel="canonical" href={DOMAIN} />
            <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
    );
}
