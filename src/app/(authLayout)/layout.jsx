// "use client";


const MainLayout = ({
  children,
}) => {
  return (
    <>

      <div>
        <div className="min-h-screen ">



          {children}

        </div>
 
      </div>
  
    </>
  );
};

export default MainLayout;
