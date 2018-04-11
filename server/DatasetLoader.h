#pragma once

#include "Dataset.h"
#include "flinalg/Linalg.h"
#include "flinalg/LinalgIO.h"
#include "precision/Precision.h"
#include "yaml-cpp/yaml.h"

#include <string>
#include <vector>

typedef 
std::pair<std::string, FortranLinalg::DenseVector<Precision>> QoiNameValuePair;

class DatasetLoader {
public:
  static Dataset* loadDataset(const std::string &filePath);
private:
  static std::string parseName(const YAML::Node &config);
  static int parseSampleCount(const YAML::Node &config);
  static FortranLinalg::DenseMatrix<Precision> parseGeometry(
      const YAML::Node &config, const std::string &filePath);
  static std::vector<QoiNameValuePair> parseQois(
      const YAML::Node &config, const std::string &filePath);
  static FortranLinalg::DenseMatrix<Precision> parseDistances(
      const YAML::Node &config);
  static QoiNameValuePair parseQoi(
      const YAML::Node &qoiNode,const std::string &filePath);
};
