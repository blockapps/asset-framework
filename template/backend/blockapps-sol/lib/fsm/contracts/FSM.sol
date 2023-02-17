
contract FSM {

    struct Transition {
        uint state;
        uint evt;
        uint newState;
    }

    // expose the transitions to the outside world
    Transition[] public transitions;

    mapping (uint => uint) stateMachine;

    function FSM(){
    }


    function handleEvent(uint _state, uint _event) returns (uint){
        return stateMachine[calculateKey(_state,_event)];
    }


    function addTransition(uint _state, uint _event, uint _newState) {
        stateMachine[calculateKey(_state, _event)] = _newState;
        transitions.push(Transition(_state, _event, _newState));
    }


    function calculateKey(uint _state, uint _event) returns (uint){
        return (_state * 1000) + _event;
    }
}
