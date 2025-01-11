import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export default function StaggeredFadeLoader({
    className,
    variant = "light",
}: {
    className?: string;
    variant?: "light" | "dark";
}) {
    const circleVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const bgColor = variant === "light" ? "bg-white" : "bg-black";

    return (
        <div
            className={cn(
                "flex items-center justify-center space-x-1",
                className
            )}
        >
            {[...Array(3)].map((_, index) => (
                <motion.div
                    key={index}
                    className={cn("size-1 rounded-full shrink-0", bgColor)}
                    variants={circleVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                ></motion.div>
            ))}
        </div>
    );
}
