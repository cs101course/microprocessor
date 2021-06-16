// Main
// Push parameters
// n
LDR0 13
PUSH

// b
LDR0 1
PUSH

// a
LDR0 0
PUSH

CALL FIB   // R1 := return val

// Release parameters
POP
POP
POP

SWAP
PRINT
HALT


FIB:

// N.B.
// n is (Frame+4)
// b is (Frame+3)
// a is (Frame+2)
// return address is (Frame+1)

// locals
PUSH       // result (Frame+0)
// End initialisation

// result := a
LSR0 2
SSR0 0

// IF (n != 0)
// (unless n == 0)

LSR0 4     // R0 := n
JZ FIB_END_IF

// Push parameters

// n - 1
LSR0 4
DEC
PUSH // (+1 from stack frame)

// a + b
LSR0 3 // account for push (2+1)
LSR1 4 // account for push (3+1)
ADD
PUSH // (+2 from stack frame)

// b
LSR0 5 // account for push (3+2)
PUSH

// recurse
CALL FIB

// release parameters
POP
POP
POP

// result := R1
SSR1 0
FIB_END_IF:

// R1 := result
LSR1 0

// release result
POP
RET
