import { AllWidgetProps, React } from "jimu-core";
import _ from "lodash";
const useState = React.useState;
const useCallback = React.useCallback;

const Widget = (props: AllWidgetProps<any>) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResult, setSearchResult] = useState<string>(""); // Result after rebouce

  // Handle for Search:
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    debouncedSearch(event.target.value);
  };

  // Lodash rebouce to decrease time request api
  const debouncedSearch = useCallback(
    _.debounce((term: string) => {
      setSearchResult(term); // Update result after type with time delay (500s)
    }, 500),
    []
  );

  return (
    <div>
      <input
        type='text'
        value={searchTerm}
        onChange={handleSearch}
        placeholder='Search...'
      />
      {/* Show the result */}
      <p>Result after debounce: {searchResult}</p>
    </div>
  );
};

export default Widget;
