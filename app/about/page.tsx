import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sean solves problems. He also loves fintech — especially business lending and personal finance.",
};

export default function About() {
  return (
    <>
      <header className="pb-8 pt-16">
        <h1 className="m-0 text-[2.4rem] font-medium tracking-[-0.02em]">About</h1>
      </header>

      <div className="prose">
        <p className="lede">
          Sean solves problems. He also loves fintech — especially business lending and
          personal finance.
        </p>
        <p>It&rsquo;s weird. He knows.</p>
        <p>
          Sean developed a deep and unique understanding of household and small business
          finance, credit risk, consumer spending patterns, and borrower relationships
          over two decades in banking and finance.
        </p>
        <p>
          Currently serving as Chief Credit Officer of GoodBread, his past includes roles
          with Bank of America, Citizens Bank, Key Bank, First Niagara Bank, HSBC, Chase,
          and BNY Mellon, with experience across consumer and business lending, credit
          analysis, portfolio management, sales strategy, and vendor selection.
        </p>
        <p>
          He believes he may have personally analyzed more combined credit reports,
          transaction histories, and borrower conversations than anyone in America. Nay,
          the world!
        </p>
        <p>It&rsquo;s hard to quantify.</p>
        <p>
          Sean originally founded CircumFi to help small business owners access low-cost
          financing through a process that generated competition among lenders. CircumFi
          is now focused on niche fintech business lending solutions.
        </p>
        <p>
          Sean has also been a Founding Member of the Hudson Valley Venture Hub, a former
          Westchester Angel, and Managing Member of Up Level Housing LLC, a real estate
          investment company.
        </p>
        <p>
          He lives with his wife, four kids, and two cats in the Hudson Valley. Probably
          a dog, too, by the time you read this.
        </p>

        <h2>Elsewhere</h2>
        <p>
          <a href="mailto:hello@seanpstewart.com">hello@seanpstewart.com</a>
        </p>
      </div>
    </>
  );
}
