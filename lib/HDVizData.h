#ifndef HDVIZDATA_H
#define HDVIZDATA_H

#include "LinalgIO.h"
#include "DenseMatrix.h"
#include "Linalg.h"
#include "colormapper.h" 
#include "Precision.h"
#include <string>

enum class HDVizLayout : char {
    ISOMAP  = 0,
    PCA = 1,
    PCA2 = 2,
};

class HDVizData{
  public:
    HDVizData(std::string path);
    Precision getSelectedCoordinate(int selectedCell, int selectedPoint, int index);
    Precision getSelectedVariance(int selectedCell, int selectedPoint, int index);
    
    void loadData(int level);
    void setLayout(HDVizLayout layout, int level);
  

    FortranLinalg::DenseVector<std::string> names;

    // Number of smaples per cell for rendering.
    int nSamples;

    // Morse-Smale edge information.
    FortranLinalg::DenseMatrix<int> edges;          //  Crystals_<level>.data.hdr
    FortranLinalg::DenseVector<Precision> pSorted;  //  Persistence.data.hdr

    unsigned nAll;

    // Extrema Layouts
    FortranLinalg::DenseVector<Precision> ef;   // Extrema Values
    FortranLinalg::DenseVector<Precision> ez;
    FortranLinalg::DenseVector<Precision> ew;   // Extrema Widths
    FortranLinalg::DenseMatrix<Precision> eL;   // Extrema layout 

    // Cell layouts
    FortranLinalg::DenseMatrix<Precision> *L;

    // Cell reconstruction
    FortranLinalg::DenseMatrix<Precision> *R;
    FortranLinalg::DenseMatrix<Precision> *Rvar;
    FortranLinalg::DenseMatrix<Precision> *gradR;
    FortranLinalg::DenseVector<Precision> Rmin; 
    FortranLinalg::DenseVector<Precision> Rmax;
    FortranLinalg::DenseVector<Precision> Rsmin; 
    FortranLinalg::DenseVector<Precision> Rsmax;
    FortranLinalg::DenseVector<Precision> Rvmin;
    FortranLinalg::DenseVector<Precision> Rvmax;
    Precision vmax;
    FortranLinalg::DenseVector<Precision> gRmin; 
    FortranLinalg::DenseVector<Precision> gRmax; 

    FortranLinalg::DenseVector<Precision> Lmin, Lmax;
    Precision efmin, efmax;
    Precision zmax, zmin;

    // filenames
    std::string m_path;

    // color/width and transparent width values
    FortranLinalg::DenseVector<Precision> *yc;
    FortranLinalg::DenseVector<Precision> *z;
    FortranLinalg::DenseVector<Precision> *yw;
    FortranLinalg::DenseVector<Precision> *yd;

    // ColorMapper for each cell
    ColorMapper<Precision> colormap;
    ColorMapper<Precision> dcolormap;

    int getMinPersistenceLevel() { return minLevel; }
    int getMaxPersistenceLevel() { return maxLevel; }
        
  private:
    void loadLayout(std::string type, std::string extFile, int level);    
    void loadColorValues(std::string type, int level);
    void loadWidthValues(std::string type, int level);
    void loadDensityValues(std::string type, int level);
    void loadReconstructions(int level);

    int minLevel;
    int maxLevel;
    HDVizLayout layout;
};

#endif
