import React, { ReactNode } from "react";

interface HeaderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  heading: string;
  description?: string;
  children?: ReactNode;
}

function SectionHeading({
  heading,
  description,
  children,
  ...props
}: HeaderProps) {
  return (
    <section className="pt-[20px] pb-[30px]" {...props}>
      <p className="max-w-4xl text-lg leading-[1.8] tracking-wide mb-2 text-accent">
        {description}
      </p>
      {/* {children} */}
    </section>
  );
}

export default SectionHeading;
