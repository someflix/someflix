import SiteFooter from '@/components/main/site-footer';
import SiteHeader from '@/components/main/site-header';


const FrontLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>{children}</main>
      <footer style={{height:'10vh'}}></footer>
    </div>
  );
};

export default FrontLayout;
