import React, { useEffect, useState } from "react";

interface StarProps {
  isDarkMode: boolean;
}

const generateStarStyles = () => {
  const size = Math.random() * 3;
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    top: `${Math.random() * 100}vh`,
    left: `${Math.random() * 100}vw`,
    animationDuration: `${Math.random() * 5 + 5}s`,
  };
  return style;
};

export default function Stars({ isDarkMode }: StarProps) {
  const [stars, setStars] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const starCount = 100;
    const newStars = [];

    for (let i = 0; i < starCount; i++) {
      const style = generateStarStyles();
      newStars.push(
        <div
          key={i}
          className="star"
          style={{
            ...style,
            position: "absolute",
            backgroundColor: "white",
            borderRadius: "50%",
            boxShadow:
              "0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)",
            filter: "blur(1px)",
          }}
        />
      );
    }

    setStars(newStars);
  }, [isDarkMode]);

  if (!isDarkMode) return null; 

  return <div>{stars}</div>;
}
