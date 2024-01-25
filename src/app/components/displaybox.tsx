import { ReactNode } from "react";

const DisplayBox = ({ children, title }: { children: ReactNode; title?: string }) => {
    return (
        <div className="relative">
            <div className="text-center mb-4 [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-black text-[32px]">{title}</div>
            <div className="w-[554px] h-[607px] shadow-[0px_16px_60px_#0000001a] rounded-3xl flex flex-col">{children}</div>
        </div>
    );
};

export default DisplayBox;
