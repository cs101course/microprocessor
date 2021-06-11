// Main
// Push parameters
// n
LDR0 100
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


FIB:

// N.B.
// n is (Frame+3)
// b is (Frame+2)
// a is (Frame+1)

// locals
PUSH       // result (Frame+0)
// End initialisation

// result := a
LSR0 1
SSR0 0

// IF (n != 0)
// (unless n == 0)

LDR0 0     // R0 := n
JZ FIB_END_IF

// Push parameters

// n - 1
LSR0 3
DEC
PUSH

// a + b
LSR0 1
LSR1 2
ADD
PUSH

// b
LSR0 2
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
