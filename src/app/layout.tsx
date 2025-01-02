import {Inter} from "next/font/google";

import "./globals.css"
import {ReactQueryClientProvider} from "../contexts/providers/react-query-client.provider";
import { sourceSerif4 } from "./fonts";

const inter = Inter({subsets: ["latin"], display: 'swap', adjustFontFallback: false});


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${inter.className}  overflow-x-hidden`}>
        <ReactQueryClientProvider>
            {children}
        </ReactQueryClientProvider>
        </body>
        </html>
    );
}