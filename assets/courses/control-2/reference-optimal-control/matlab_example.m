A=[0 1;-2 -3];B=[0;1];C=[1 0];K=place(A,B,[-2 -4]);
N=-1/(C*((A-B*K)\B)); assert(abs(N-8)<1e-8);
t=(0:.005:5)';y=lsim(ss(A-B*K,B*N,C,0),ones(size(t)),t);plot(t,y);grid on;
[Klqr,P,e]=lqr(A,B,diag([4 1]),1);assert(all(real(e)<0));
disp(Klqr);disp(N);
