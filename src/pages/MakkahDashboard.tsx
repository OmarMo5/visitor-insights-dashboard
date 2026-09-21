import SiteDashboard from "./SiteDashboard";
import { getSiteById } from "@/lib/sites";

const MakkahDashboard = () => <SiteDashboard site={getSiteById("makkah")!} />;

export default MakkahDashboard;
