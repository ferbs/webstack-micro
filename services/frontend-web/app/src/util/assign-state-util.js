/**
 * The React.useState hook is very nice, but setState does not merge or assign updates to existing state, it overrites state.
 * This util function creates an object-assign based version.
 * Examples:
 *
 * const [ myData, setMyData ] = React.useState({ bait: 'fish', cats: 5 });
 * const assignMyData = asStateAssigment(setMyData);
 * assignMyData({ cats: 6 }); // state is now { someValue: 4, another: 6 }. Had we used setMyData, we would have lost the "bait" field
 * assignMyData(prev => { another: prev.cats + 1 })
 *
 * @param setState
 */
export default function asStateAssigment(setState) {
  return (updates) => {
    setState(prev => ({...prev, ...(typeof updates === 'function' ? updates(prev) : updates) }));
  };
}
