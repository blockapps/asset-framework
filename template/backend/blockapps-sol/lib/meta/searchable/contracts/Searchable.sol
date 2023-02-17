contract Searchable {
  bool constant isSearchable = true;
  uint searchCounter;

  function Searchable() {
    searchCounter = 1;
  }

  function searchable() returns (uint) {
    return ++searchCounter;
  }
}
