import { MadeWithDyad } from "@/components/made-with-dyad";
import PetWhisperer from "@/components/PetWhisperer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <PetWhisperer />
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;