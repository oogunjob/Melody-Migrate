import { ReactNode } from "react";

const DisplayBox = ({ children }: { children: ReactNode }) => {
    return (
        <div className="relative">
            <div className="w-[554px] h-[607px] shadow-[0px_16px_60px_#0000001a] rounded-3xl flex flex-col">
                {children}
            </div>
        </div>
    );
};

export default DisplayBox;
