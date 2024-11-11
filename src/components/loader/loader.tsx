import React, {useEffect} from "react";

export default function Loader({size = "20", color = "black", ...rest}) {
    useEffect(() => {
        async function getLoader() {
            const {ring2} = await import('ldrs');
            ring2.register();
        }

        getLoader();
    }, []);

    const baseSize = 20; // Set the base size for scaling
    const calculatedSize = parseFloat(size);
    const scale = calculatedSize / baseSize;

    // Adjust stroke and stroke-length based on the scale
    const stroke = 2.5 * scale; // Scale stroke size
    const strokeLength = 0.25 * scale; // Scale stroke-length

    return (
        <l-ring-2
            size={size}
            stroke={stroke.toString()}
            stroke-length={strokeLength.toString()}
            bg-opacity="0.1"
            speed="0.8"
            color={color}
            {...rest}
        />
    );
}
