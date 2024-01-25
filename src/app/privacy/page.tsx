import React from "react";
import SEO from "../components/seo";
import Footer from "../components/footer";

function Privacy() {
    return (
        <div className="flex flex-col bg-[#f8f8f8] min-h-screen">
            <SEO title="Privacy" description="Testing" />

            <section id="privacy" className="flex-1">
                <h1 className="flex justify-center font-semibold text-2xl md:text-4xl pb-7 py-10">Privacy Policy</h1>
                <div className="max-w-sm md:max-w-2xl mx-5 md:mx-auto">
                    <p className="pb-5">
                        This service is free of use for all users who want to transfer their music. For all visitors, Universal Music Library Transfer
                        does not collect, use, or disclose any personal information to any third-party from those who use the service. All code that
                        is run is hosted and maintatined on GitHub for transparency and improvments. Universal Music Library Transfer uses Google
                        Analytics to analyze web traffic and improve upon current features. If you choose to use , then you agree to the terms of this
                        policy.
                    </p>

                    <p className="pb-5">
                        {`Universal Music Library Transfer integrates the use of the Spotify Web API, Apple Music Music Kit, and the public APIs of LastFm and Deezer. For all integrated services, the scope of the permissions granted have been limited to only
                read the user's top streamed artists and songs to create a more accurate personalized graphic. Data is securely presented to only the user,
                and Universal Music Library Transfer has no access to modifying or removing any data from your music library. For those who wish to opt out to using an integrated API, you are welcome to using the app via the
                Start From Scratch login option.`}
                    </p>
                </div>
            </section>
            <Footer />
        </div>
    );
}

export default Privacy;
