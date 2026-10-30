A0=[0 1;-2 -3];B0=[0;1];C=[1 0];K=place(A0,B0,[-2 -4]);N=8;
t=(0:.005:6)';hold on;
for m=[.7 1 1.3]
 A=[0 1;-2/m -3/m];B=[0;1/m];assert(all(real(eig(A-B*K))<0));
 y=lsim(ss(A-B*K,B*N,C,0),ones(size(t)),t);plot(t,y);disp(eig(A-B*K));
end
hold off;xlabel('Time [s]');ylabel('Position');grid on;
