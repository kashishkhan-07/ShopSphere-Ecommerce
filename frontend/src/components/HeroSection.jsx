import React from "react";
import {
  ShieldCheck,
  Lock,
  Truck,
  RotateCcw,
  Headphones,
  Star,
  ArrowRight,
  Store,
} from "lucide-react";

export default function HeroSection({ onShopNow, onExploreStores }) {
  return (
    <div className="w-full space-y-5 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Main Layout */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">

        {/* ================= HERO SECTION ================= */}
        <div
          className="
            relative
            min-h-[300px]
            overflow-hidden
            rounded-3xl
            border border-[#0A3D33]
            bg-[#04241e]
            shadow-2xl
            sm:min-h-[350px]
            lg:col-span-8
            lg:min-h-[350px]
          "
        >

          {/* Full Hero Image */}
          <div className="absolute inset-0">
            <img
              src="/hero-banner-exact.png"
              alt="ShopSphere products"
              className="
                h-full
                w-full
                object-cover
                object-center
              "
            />
          </div>

          {/* Subtle Overlay - Low Transparency */}
          <div
            className="
              absolute
              inset-0
              z-[1]
              bg-gradient-to-r
              from-[#04241e]/80
              via-[#04241e]/30
              to-transparent
            "
          />

          {/* Very Light Bottom Overlay */}
          <div
            className="
              absolute
              inset-x-0
              bottom-0
              z-[1]
              h-24
              bg-gradient-to-t
              from-[#04241e]/20
              to-transparent
            "
          />

          {/* Content */}
          <div
            className="
              relative
              z-10
              flex
              h-full
              min-h-[300px]
              items-center
              sm:min-h-[350px]
              lg:min-h-[350px]
            "
          >

            <div
              className="
                w-full
                p-5
                sm:w-[68%]
                sm:p-7
                lg:w-[55%]
                lg:p-8
              "
            >

              {/* Badge */}
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-[#C9A86A]/40
                  bg-[#0f4036]/90
                  px-3
                  py-1
                  text-[10px]
                  font-bold
                  text-[#C9A86A]
                  shadow-sm
                  backdrop-blur-sm
                "
              >
                <Star
                  size={11}
                  className="fill-[#C9A86A] text-[#C9A86A]"
                />

                Multi-Vendor Marketplace
              </span>

              {/* Heading */}
              <h1
                className="
                  mt-3
                  text-2xl
                  font-extrabold
                  leading-[1.1]
                  tracking-tight
                  text-white
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                Shop{" "}
                <span className="text-[#C9A86A]">
                  authentic.
                </span>

                <br />

                Support{" "}
                <span className="text-[#C9A86A]">
                  local.
                </span>
              </h1>

              {/* Description */}
              <p
                className="
                  mt-3
                  max-w-sm
                  text-xs
                  leading-relaxed
                  text-slate-200
                  sm:text-sm
                "
              >
                Explore verified sellers, quality products and handcrafted
                brands across categories.
              </p>

              {/* Buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-2.5">

                {/* Shop Now */}
                <button
                  onClick={onShopNow}
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-[#C9A86A]/50
                    bg-[#09352c]/95
                    px-4
                    py-2.5
                    text-[11px]
                    font-bold
                    text-white
                    shadow-md
                    transition
                    hover:bg-[#0e4539]
                  "
                >
                  <span>Shop Now</span>
                  <ArrowRight size={14} />
                </button>

                {/* Explore Stores */}
                <button
                  onClick={onExploreStores}
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-[#C9A86A]/60
                    bg-black/10
                    px-4
                    py-2.5
                    text-[11px]
                    font-bold
                    text-[#C9A86A]
                    backdrop-blur-sm
                    transition
                    hover:bg-white/10
                  "
                >
                  <Store size={14} />
                  <span>Explore Stores</span>
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* ================= WHY SHOPSPHERE ================= */}
        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border border-[#C9A86A]/20
            bg-gradient-to-br
            from-[#FBF9F4]
            via-[#F8F5EC]
            to-[#EEF5F0]
            p-5
            shadow-md
            lg:col-span-4
          "
        >

          {/* Decorative Background */}
          <div
            className="
              absolute
              -right-10
              -top-10
              h-24
              w-24
              rounded-full
              bg-[#C9A86A]/10
              blur-2xl
            "
          />

          <div
            className="
              absolute
              -bottom-10
              -left-8
              h-24
              w-24
              rounded-full
              bg-[#063F35]/10
              blur-2xl
            "
          />

          <div className="relative z-10">

            {/* Header */}
            <div className="mb-4 flex items-center justify-between">

              <div>
                <p
                  className="
                    mb-0.5
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-[#C9A86A]
                  "
                >
                  Shop With Confidence
                </p>

                <h3 className="text-base font-black tracking-tight text-[#063F35]">
                  Why ShopSphere?
                </h3>
              </div>

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[#C9A86A]/25
                  bg-white/70
                  text-[#063F35]
                  shadow-sm
                "
              >
                <ShieldCheck size={18} />
              </div>

            </div>

            {/* Features */}
            <div className="space-y-2">

              <Feature
                icon={<ShieldCheck size={15} />}
                title="Verified Sellers"
                description="Trusted & quality products"
              />

              <Feature
                icon={<Lock size={15} />}
                title="Secure Payments"
                description="100% protected transactions"
              />

              <Feature
                icon={<Truck size={15} />}
                title="Fast Delivery"
                description="Across verified sellers"
              />

              <Feature
                icon={<RotateCcw size={15} />}
                title="Easy Returns"
                description="Hassle-free returns"
              />

              <Feature
                icon={<Headphones size={15} />}
                title="Live Support"
                description="24/7 customer support"
              />

            </div>

            {/* Trust Badge */}
            <div
              className="
                mt-4
                flex
                items-center
                gap-2.5
                rounded-xl
                border
                border-[#063F35]/10
                bg-white/60
                px-3
                py-2
              "
            >

              <div
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#063F35]
                  text-[#C9A86A]
                "
              >
                <Star
                  size={13}
                  className="fill-current"
                />
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#063F35]">
                  Shopping made simple
                </p>

                <p className="text-[8px] text-slate-500">
                  Trusted marketplace experience
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}


/* ================= FEATURE COMPONENT ================= */

function Feature({ icon, title, description }) {
  return (
    <div
      className="
        group
        flex
        items-center
        gap-2.5
        rounded-xl
        bg-white/50
        px-2.5
        py-2
        transition-all
        duration-200
        hover:bg-white/90
        hover:shadow-sm
      "
    >

      {/* Icon */}
      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-[#063F35]/10
          text-[#063F35]
          transition
          group-hover:bg-[#063F35]
          group-hover:text-[#C9A86A]
        "
      >
        {icon}
      </div>

      {/* Text */}
      <div className="min-w-0">

        <h4 className="text-[11px] font-extrabold leading-tight text-slate-900">
          {title}
        </h4>

        <p className="mt-0.5 text-[9px] leading-tight text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}