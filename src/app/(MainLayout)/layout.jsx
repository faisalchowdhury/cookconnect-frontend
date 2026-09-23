import Footer from "../../app/component/shared/Footer";
import Navbar from "../../app/component/shared/Navbar";
import StickyAdBanner from "../../app/component/ui/StickyAdBanner";

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Follows the user across every page for the session (Change Req 04). */}
      <StickyAdBanner />
    </div>
  );
};

export default MainLayout;
