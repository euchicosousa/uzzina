import { Link, useMatches } from "react-router";
import type { AppLoaderData } from "./app";
import { getShortText } from "~/components/uzzina/UAvatar";
import { cn } from "~/lib/utils";

export default function AppHome() {
  return (
    <div>
      <Partners />
    </div>
  );
}

const Partners = () => {
  const { partners } = useMatches()[1].loaderData as AppLoaderData;
  return (
    <div className="border_after">
      <div className="border_after">
        <h3 className="p-8">Parcerias</h3>
      </div>
      <div
        className={cn(
          "grid grid-cols-3 text-center text-xl leading-none font-bold uppercase sm:grid-cols-4 md:grid-cols-6 lg:text-3xl",
          Math.ceil(partners.length / 2) === 7
            ? "md:grid-cols-7"
            : Math.ceil(partners.length / 2) === 8
              ? "md:grid-cols-8"
              : "",
        )}
      >
        {partners.map((partner) => (
          <Link
            to={`/partner/${partner.id}`}
            key={partner.id}
            className="bg-muted grid place-content-center p-8"
          >
            {getShortText(partner.short)}
          </Link>
        ))}
      </div>

      <div>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab voluptatem
          animi asperiores, id libero recusandae sint suscipit necessitatibus
          amet nulla blanditiis corrupti iste voluptate incidunt unde nesciunt
          quaerat! Ipsa, minima?
        </p>
        <p>
          Itaque labore animi aperiam iusto ad facilis! Dolores porro
          perspiciatis quia harum vitae assumenda velit rerum nemo beatae modi?
          Odio ullam sit placeat officiis deleniti dicta voluptates quod atque
          iste!
        </p>
        <p>
          Libero nostrum tenetur ex eos consequatur itaque optio blanditiis,
          aliquam, odit iusto accusamus delectus nihil commodi qui in
          perspiciatis dolorem corrupti quod? Error impedit voluptates sint quae
          quod deserunt obcaecati.
        </p>
        <p>
          Iusto necessitatibus repellendus nostrum architecto quos. Rerum quam
          fugit ad mollitia ipsam delectus! Dolorem ratione, rerum minus
          repellendus voluptatem laborum maiores, est fugit eius corrupti nihil
          similique ut reprehenderit enim?
        </p>
        <p>
          Et fugiat quo consequuntur esse alias ab perspiciatis iusto? At
          consectetur nemo quasi, libero enim assumenda commodi voluptatibus
          minima. Reprehenderit ipsum ipsam tenetur alias minima atque maxime
          autem quam ad?
        </p>
        <p>
          Soluta, ab temporibus enim reiciendis aliquam nam atque, nulla
          corporis sit optio tenetur neque facere labore voluptas dicta!
          Suscipit nihil quaerat assumenda amet maiores quis molestias laborum
          sed reprehenderit deleniti.
        </p>
        <p>
          Corporis officia alias, ut, pariatur, enim quas velit animi vero
          officiis necessitatibus aliquid. Praesentium autem in distinctio ullam
          atque repellendus perspiciatis, perferendis nulla saepe totam
          dignissimos architecto exercitationem possimus suscipit!
        </p>
        <p>
          Doloremque officia tempora quos maxime. Quisquam animi iste minus
          corrupti. A vitae nobis magnam. Quia modi commodi iusto dolores
          blanditiis rerum eos nesciunt incidunt? Dolores voluptatem laboriosam
          fuga quaerat atque.
        </p>
        <p>
          Consectetur quisquam facilis iure ut debitis officiis cupiditate eius
          nihil incidunt dicta? Earum totam amet provident ex a hic quas eos.
          Maxime, sunt praesentium! Eum omnis repudiandae neque soluta et.
        </p>
        <p>
          Expedita voluptatem asperiores exercitationem consequatur est alias
          nesciunt, consectetur praesentium quaerat reiciendis, repudiandae
          facere dolore excepturi facilis porro harum. Esse in quas illo ad
          magnam maxime alias! Aspernatur, modi nemo!
        </p>
      </div>
    </div>
  );
};
