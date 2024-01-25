import Link from "next/link";
import React from "react";

function Footer() {
    return (
        <div className="w-full h-[120px] bg-white border-gray-200 border-t p-5 text-center text-slate-800 flex flex-col items-center justify-center">
            <div className="flex justify-evenly space-x-10 mt-4 text-lg text-gray-600">
                <div>
                    <a href="https://github.com/oogunjob/Universal-Music-Library-Transfer" target="_blank" className="flex items-center space-x-2">
                        <img src="/icons/github-mark.svg" alt="Github Icon" className="w-6 h-6" />
                        <span>GitHub</span>
                    </a>
                </div>

                <div>
                    <Link href="privacy">Privacy</Link>
                </div>

                <div>
                    <Link href="feedback">Feedback</Link>
                </div>
            </div>
            <p className="mt-6 text-lg text-gray-600">
                Created by{" "}
                <a target="_blank" href="https://www.linkedin.com/in/oluwatosin-ogunjobi/" className="text-blue-500 underline">
                    Tosin Ogunjobi
                </a>
            </p>
        </div>
    );
}

export default Footer;
