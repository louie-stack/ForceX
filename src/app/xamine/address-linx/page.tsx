import { permanentRedirect } from "next/navigation";

/** The old marketing page; Address LinX now lives with the other Xamine tools. */
export default function AddressLinxRedirect() {
  permanentRedirect("/xamine/tools/address-linx");
}
