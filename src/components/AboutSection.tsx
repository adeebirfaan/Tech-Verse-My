import Link from "next/link";
import { Scribble } from "./Scribble";

export function AboutSection() {
  return (
    <section id="about" className="band" aria-labelledby="about-title">
      <div className="container band__grid">
        <div className="band__copy">
          <h2 id="about-title" className="section__title">Why this list exists</h2>
          <p className="band__text">
            Techverse MY lists apps and websites made by Malaysian developers and small teams.
            Local tech should be easy to find, and the people who build it on their own deserve to be seen.
          </p>
        </div>

        <div className="band__submit">
          <p className="hand band__hand">built something?</p>
          <h3 className="band__title">Add it to the list with one short form.</h3>
          <Link href="/submit" className="btn btn--field">
            Submit your project
          </Link>
          <Scribble kind="arrow-up" className="band__arrow" />
        </div>
      </div>
    </section>
  );
}
