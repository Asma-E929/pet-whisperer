import { MadeWithDyad } from "@/components/made-with-dyad";
import PetWhisperer from "@/components/PetWhisperer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <a
        href="#pet-whisperer-card"
        className="skip-link"
        tabIndex={0}
      >
        Skip to Pet Whisperer
      </a>
      <PetWhisperer />
      <div className="mt-8">
        <MadeWithDyad />
      </div>
      <style>
        {`
          .skip-link {
            position: absolute;
            left: 1rem;
            top: 1rem;
            z-index: 50;
            background: #fff;
            color: #2563eb;
            padding: 0.5rem 1.25rem;
            border-radius: 0.375rem;
            box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
            opacity: 0;
            transform: translateY(-2rem);
            transition: opacity 0.2s, transform 0.2s;
            outline: none;
            border: 2px solid transparent;
            font-weight: 600;
            font-size: 1rem;
          }
          .skip-link:focus, .skip-link:focus-visible {
            opacity: 1;
            transform: translateY(0);
            border-color: #2563eb;
            box-shadow: 0 0 0 3px #93c5fd;
            color: #1e40af;
          }
        `}
      </style>
    </div>
  );
};

export default Index;