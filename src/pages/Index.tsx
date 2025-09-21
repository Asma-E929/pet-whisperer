import { MadeWithDyad } from "@/components/made-with-dyad";
import PetWhisperer from "@/components/PetWhisperer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <a
        href="#pet-whisperer-card"
        className="absolute left-2 top-2 z-50 bg-white text-blue-700 px-3 py-1 rounded shadow focus:translate-y-0 focus:opacity-100 opacity-0 -translate-y-8 transition-all duration-200 focus:outline-none"
        tabIndex={0}
        style={{ position: "absolute" }}
      >
        Skip to Pet Whisperer
      </a>
      <PetWhisperer />
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;